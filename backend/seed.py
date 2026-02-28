"""Seed the database with data from the frontend JSON files."""

import json
import os
import sys
import time

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent to path so we can import app modules
sys.path.insert(0, os.path.dirname(__file__))

from app.database import Base
from app.models import Product, TussCode

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://descobre:descobre@db:5432/descobre_saude"
)

# Paths to JSON files - check Docker mount path first, then relative path
def _find_data_file(filename):
    # Docker: data is mounted at /app/src/data or /data/src/data
    for base in ["/data/src/data", "/app/src/data", os.path.join(os.path.dirname(__file__), "..", "src", "data")]:
        path = os.path.join(base, filename)
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"Could not find {filename} in any expected location")

PRODUCTS_JSON = _find_data_file("products.json")
TUSS_JSON = _find_data_file("tuss.json")


def wait_for_db(engine, retries=30, delay=2):
    """Wait for the database to become available."""
    for attempt in range(retries):
        try:
            with engine.connect() as conn:
                from sqlalchemy import text
                conn.execute(text("SELECT 1"))
                print(f"Database connected on attempt {attempt + 1}")
                return True
        except Exception as e:
            print(f"Attempt {attempt + 1}/{retries}: Database not ready - {e}")
            time.sleep(delay)
    raise RuntimeError("Could not connect to database after multiple retries")


def seed_products(session, json_path):
    """Load products from JSON and insert into DB."""
    existing_count = session.query(Product).count()
    if existing_count > 0:
        print(f"Products table already has {existing_count} rows, skipping seed.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        raw_products = json.load(f)

    print(f"Seeding {len(raw_products)} products...")
    batch = []
    for i, raw in enumerate(raw_products):
        product = Product(
            cod_produto=raw["codProduto"],
            plano_produto=raw["planoProduto"],
            plano_ans=raw["planoANS"],
            nome_registrado_ans=raw["nomeRegistradoANS"],
            segmentacao=raw["segmentacao"],
            classificacao=raw["classificacao"],
            cod_operadora=raw["codOperadora"],
            nome_operadora=raw["nomeOperadora"],
            situacao=raw["situacao"],
            cod_produto_api=raw["codProdutoAPI"],
            cod_plano_api=raw["codPlanoAPI"],
        )
        batch.append(product)

        if len(batch) >= 1000:
            session.bulk_save_objects(batch)
            session.commit()
            print(f"  Inserted {i + 1} products...")
            batch = []

    if batch:
        session.bulk_save_objects(batch)
        session.commit()

    final_count = session.query(Product).count()
    print(f"Seeded {final_count} products.")


def seed_tuss_codes(session, json_path):
    """Load TUSS codes from JSON and insert into DB."""
    existing_count = session.query(TussCode).count()
    if existing_count > 0:
        print(f"TUSS codes table already has {existing_count} rows, skipping seed.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        raw_tuss = json.load(f)

    print(f"Seeding {len(raw_tuss)} TUSS codes...")
    batch = []
    for i, raw in enumerate(raw_tuss):
        tuss = TussCode(
            codigo=raw["codigo"],
            descricao=raw["descricao"],
        )
        batch.append(tuss)

        if len(batch) >= 1000:
            session.bulk_save_objects(batch)
            session.commit()
            print(f"  Inserted {i + 1} TUSS codes...")
            batch = []

    if batch:
        session.bulk_save_objects(batch)
        session.commit()

    final_count = session.query(TussCode).count()
    print(f"Seeded {final_count} TUSS codes.")


def main():
    print(f"Connecting to: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    wait_for_db(engine)

    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        seed_products(session, PRODUCTS_JSON)
        seed_tuss_codes(session, TUSS_JSON)
        print("Seeding complete!")
    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
