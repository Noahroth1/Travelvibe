import importlib
import os
import unittest
from unittest.mock import patch


class ConfigTests(unittest.TestCase):
    def test_defaults_to_sqlite_when_no_database_url_is_set(self):
        import app.config as config_module

        with patch.dict(os.environ, {}, clear=True):
            reloaded_module = importlib.reload(config_module)

        self.assertEqual(reloaded_module.settings.database_url, "sqlite:///./travelvibe.db")


if __name__ == "__main__":
    unittest.main()
