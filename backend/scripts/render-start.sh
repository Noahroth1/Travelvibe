#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

alembic upgrade head
python -m app.seed

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
