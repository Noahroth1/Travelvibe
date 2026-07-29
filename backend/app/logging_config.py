import logging
import os


def configure_logging() -> logging.Logger:
    """Configure a reusable application logger"""
    logger_name = "travelvibe"
    logger = logging.getLogger(logger_name)

    if logger.handlers:
        return logger

    log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    )

    logger.setLevel(log_level)
    handler.setLevel(log_level)
    logger.addHandler(handler)
    logger.propagate = False

    return logger


def get_logger(name: str) -> logging.Logger:
    """Return a namespaced logger for a specific module."""
    configure_logging()
    return logging.getLogger(f"travelvibe.{name}")
