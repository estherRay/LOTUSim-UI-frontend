/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 * 
 * LogPanel.tsx file
 * 
 */
import React, { useState } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface LogPanelProps {
  logs: string[]; // placeholder
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Box
        onClick={() => setIsOpen((prev) => !prev)}
        sx={{
          position: 'absolute',
          top: 16,
          right: isOpen ? 320 : 0,
          zIndex: 1100,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          color: '#e2e8f0',
          padding: '10px 6px',
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          userSelect: 'none',
          fontSize: 13,
          letterSpacing: 1,
          fontFamily: theme.typography.fontFamily,
          transition: 'right 0.2s ease',
        }}
      >
        Log
      </Box>

      {isOpen && (
        <Box
          component={Paper}
          elevation={4}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 320,
            height: '100%',
            zIndex: 1050,
            overflowY: 'auto',
            padding: 2,
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            fontFamily: theme.typography.fontFamily,
            fontSize: 12,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            LOTUSim Log
          </Typography>
          {logs.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No log messages yet
            </Typography>
          ) : (
            logs.map((line, i) => (
              <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>
                {line}
              </div>
            ))
          )}
        </Box>
      )}
    </>
  );
};