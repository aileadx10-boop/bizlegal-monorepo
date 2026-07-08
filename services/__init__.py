"""
services/ — package root for all BizLegal non-Vercel runtimes.

Marked as a real package on 2026-07-08 so that
`from services.agents.<x> import run` works in orchestrator dispatch
(orchestrator was getting ModuleNotFoundError: No module named 'services'
when trying to load 'code' agent via services.agents.code_agent path).
"""
