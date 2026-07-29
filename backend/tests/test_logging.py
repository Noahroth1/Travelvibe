import logging
import unittest

from app.logging_config import configure_logging, get_logger


class LoggingConfigurationTests(unittest.TestCase):
    def test_configure_logging_sets_up_stream_handler(self) -> None:
        logger = configure_logging()

        self.assertEqual(logger.name, "travelvibe")
        self.assertEqual(logger.level, logging.INFO)
        self.assertTrue(any(isinstance(handler, logging.StreamHandler) for handler in logger.handlers))

    def test_get_logger_returns_namespaced_logger(self) -> None:
        logger = get_logger("destinations")

        self.assertEqual(logger.name, "travelvibe.destinations")


if __name__ == "__main__":
    unittest.main()
