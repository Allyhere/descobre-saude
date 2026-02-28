"""
Scheduler for the SulAmerica scraper.

Uses APScheduler to run the scraper on a configurable schedule.
Default: every 24 hours.
"""

import logging
import os
import signal
import sys

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

from sul_america_scraper import run_scraper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("scheduler")

# Scrape interval in hours (default: 24)
SCRAPE_INTERVAL_HOURS = int(os.environ.get("SCRAPE_INTERVAL_HOURS", "24"))


def main():
    logger.info(f"Scraper scheduler starting (interval: {SCRAPE_INTERVAL_HOURS}h)")

    # Run once immediately on startup
    logger.info("Running initial scrape...")
    try:
        run_scraper()
    except Exception as e:
        logger.error(f"Initial scrape failed: {e}")

    # Set up scheduled runs
    scheduler = BlockingScheduler()
    scheduler.add_job(
        run_scraper,
        trigger=IntervalTrigger(hours=SCRAPE_INTERVAL_HOURS),
        id="sul_america_scrape",
        name="SulAmerica data scrape",
        replace_existing=True,
    )

    # Graceful shutdown
    def shutdown(signum, frame):
        logger.info("Shutting down scheduler...")
        scheduler.shutdown(wait=False)
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    logger.info("Scheduler started. Waiting for next run...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")


if __name__ == "__main__":
    main()
