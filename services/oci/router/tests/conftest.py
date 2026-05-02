"""Make the flat router/ app importable from tests/ subdirectory."""
import sys
from pathlib import Path

ROUTER_DIR = Path(__file__).resolve().parent.parent
if str(ROUTER_DIR) not in sys.path:
    sys.path.insert(0, str(ROUTER_DIR))
