#!/bin/bash
cd /home/kavia/workspace/code-generation/medical-technology-account-insights-dashboard-217475-217484/frontend_dashboard
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

