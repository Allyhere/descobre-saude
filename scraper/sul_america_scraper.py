"""
SulAmerica scraper using Selenium (headless Chrome).

Scrapes product/plan data and TUSS codes from the SulAmerica public portal
and stores them in the PostgreSQL database.
"""

import json
import logging
import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path for models - works both locally and in Docker
for _p in [
    os.path.join(os.path.dirname(__file__), "..", "backend"),  # local dev
    os.path.join(os.path.dirname(__file__), "backend"),  # Docker context
]:
    if os.path.isdir(os.path.join(_p, "app")):
        sys.path.insert(0, _p)
        break

from app.database import Base
from app.models import Product, TussCode

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("sul_america_scraper")

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://descobre:descobre@db:5432/descobre_saude"
)

# SulAmerica API endpoints (public)
PRODUCTS_API_URL = (
    "https://portal.sulamericaseguros.com.br/api/v1/rede-referenciada/produtos"
)
TUSS_API_URL = "https://www.ans.gov.br/component/tuss/"


def get_driver() -> webdriver.Chrome:
    """Create a headless Chrome WebDriver instance."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument(
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )

    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception:
        # Fallback: try system chromedriver
        chrome_options.add_argument("--remote-debugging-port=9222")
        driver = webdriver.Chrome(options=chrome_options)

    driver.set_page_load_timeout(30)
    return driver


def scrape_products_from_api() -> list[dict]:
    """
    Attempt to scrape SulAmerica products via their public portal.

    The SulAmerica portal exposes product data through a search interface.
    This scraper navigates the referral network page and extracts product information.
    """
    logger.info("Starting SulAmerica product scrape...")
    driver = get_driver()
    products = []

    try:
        # Navigate to the SulAmerica referral network page
        url = "https://portal.sulamericaseguros.com.br/planos-de-saude/rede-referenciada/"
        logger.info(f"Navigating to: {url}")
        driver.get(url)

        # Wait for the page to load
        time.sleep(5)

        # Try to find product/plan data in the page
        # The portal uses JavaScript to load data dynamically
        page_source = driver.page_source

        # Look for embedded JSON data or API calls in the page
        scripts = driver.find_elements(By.TAG_NAME, "script")
        for script in scripts:
            try:
                text = script.get_attribute("innerHTML")
                if text and ("codProduto" in text or "planoProduto" in text):
                    # Try to extract JSON data from script tags
                    start = text.find("[")
                    end = text.rfind("]") + 1
                    if start >= 0 and end > start:
                        data = json.loads(text[start:end])
                        if isinstance(data, list) and len(data) > 0:
                            products = data
                            logger.info(
                                f"Found {len(products)} products in page scripts"
                            )
                            break
            except (json.JSONDecodeError, Exception):
                continue

        if not products:
            logger.warning(
                "Could not find product data in page scripts. "
                "The portal structure may have changed."
            )

    except Exception as e:
        logger.error(f"Error scraping products: {e}")
    finally:
        driver.quit()

    return products


def store_products(session, products: list[dict]) -> int:
    """Store scraped products in the database, updating existing ones."""
    if not products:
        logger.warning("No products to store.")
        return 0

    stored = 0
    for raw in products:
        try:
            # Check if product already exists
            existing = (
                session.query(Product)
                .filter(
                    Product.cod_produto == raw.get("codProduto", ""),
                    Product.plano_produto == raw.get("planoProduto", ""),
                    Product.cod_plano_api == raw.get("codPlanoAPI", ""),
                )
                .first()
            )

            if existing:
                # Update existing product
                existing.plano_ans = raw.get("planoANS", "")
                existing.nome_registrado_ans = raw.get("nomeRegistradoANS", "")
                existing.segmentacao = raw.get("segmentacao", "")
                existing.classificacao = raw.get("classificacao", "")
                existing.cod_operadora = raw.get("codOperadora", "")
                existing.nome_operadora = raw.get("nomeOperadora", "")
                existing.situacao = raw.get("situacao", "")
                existing.cod_produto_api = raw.get("codProdutoAPI", "")
            else:
                # Insert new product
                product = Product(
                    cod_produto=raw.get("codProduto", ""),
                    plano_produto=raw.get("planoProduto", ""),
                    plano_ans=raw.get("planoANS", ""),
                    nome_registrado_ans=raw.get("nomeRegistradoANS", ""),
                    segmentacao=raw.get("segmentacao", ""),
                    classificacao=raw.get("classificacao", ""),
                    cod_operadora=raw.get("codOperadora", ""),
                    nome_operadora=raw.get("nomeOperadora", ""),
                    situacao=raw.get("situacao", ""),
                    cod_produto_api=raw.get("codProdutoAPI", ""),
                    cod_plano_api=raw.get("codPlanoAPI", ""),
                )
                session.add(product)

            stored += 1

            if stored % 500 == 0:
                session.commit()
                logger.info(f"  Stored {stored} products...")

        except Exception as e:
            logger.error(f"Error storing product: {e}")
            session.rollback()
            continue

    session.commit()
    logger.info(f"Stored/updated {stored} products total.")
    return stored


def run_scraper():
    """Main scraper entry point."""
    logger.info("=" * 60)
    logger.info("Starting SulAmerica scraper run...")
    logger.info("=" * 60)

    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Scrape products
        products = scrape_products_from_api()
        if products:
            store_products(session, products)
        else:
            logger.info(
                "No new products scraped. Existing data from seed remains."
            )

        logger.info("Scraper run complete.")

    except Exception as e:
        logger.error(f"Scraper run failed: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    run_scraper()
