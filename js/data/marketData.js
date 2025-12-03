window.MarketData = {
    sectors: {
        'Technology': [
            'AAPL', 'MSFT', 'NVDA', 'AVGO', 'CSCO', 'CRM', 'ADBE', 'AMD', 'INTC', 'QCOM', 'TXN', 'IBM', 'ORCL', 'NOW', 'AMAT', 'MU', 'ADI', 'LRCX', 'PANW', 'SNPS', 'KLAC', 'CDNS', 'ROP', 'NXPI', 'APH', 'FTNT', 'MSI', 'TEL', 'IT', 'HPQ', 'GLW', 'HPE', 'DXC', 'FFIV', 'JNPR', 'STX', 'WDC', 'NTAP', 'ANET', 'KEYS', 'TRMB', 'TER', 'SWKS', 'QRVO', 'ACN', 'CTSH', 'CDW', 'FICO', 'GEN', 'PTC', 'TYL', 'VRSN', 'AKAM'
        ],
        'Communication Services': [
            'GOOGL', 'GOOG', 'META', 'NFLX', 'DIS', 'CMCSA', 'TMUS', 'VZ', 'T', 'CHTR', 'WBD', 'PARA', 'FOXA', 'FOX', 'NWS', 'NWSA', 'OMC', 'IPG', 'LYV', 'EA', 'TTWO', 'MTCH'
        ],
        'Consumer Discretionary': [
            'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TJX', 'BKNG', 'F', 'GM', 'TGT', 'MAR', 'HLT', 'YUM', 'RCL', 'CCL', 'NCLH', 'LVS', 'MGM', 'WYNN', 'CZR', 'EXPE', 'ABNB', 'EBAY', 'ETSY', 'BBY', 'ULTA', 'TSCO', 'ROST', 'ORLY', 'AZO', 'AAP', 'GPC', 'KMX', 'DRI', 'CMG', 'DPZ', 'LEN', 'DHI', 'PHM', 'NVR', 'TOL', 'MHK', 'VFC', 'RL', 'TPR', 'CPRI', 'PVH', 'HOG', 'HAS', 'MAT'
        ],
        'Consumer Staples': [
            'PG', 'COST', 'PEP', 'KO', 'WMT', 'PM', 'MO', 'EL', 'CL', 'KMB', 'GIS', 'K', 'MKC', 'CAG', 'CPB', 'SJM', 'HRL', 'TSN', 'ADM', 'BG', 'SYY', 'KR', 'DG', 'DLTR', 'WBA', 'TAP', 'STZ', 'BF.B', 'MNST', 'CHD', 'CLX'
        ],
        'Energy': [
            'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PXD', 'VLO', 'OXY', 'HES', 'KMI', 'WMB', 'OKE', 'TRGP', 'HAL', 'BKR', 'DVN', 'FANG', 'CTRA', 'MRO', 'APA', 'EQT', 'PSX'
        ],
        'Financials': [
            'BRK.B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'MS', 'GS', 'BLK', 'C', 'SCHW', 'AXP', 'SPGI', 'MCO', 'MMC', 'AON', 'PGR', 'TRV', 'CB', 'ALL', 'HIG', 'MET', 'PRU', 'AIG', 'USB', 'PNC', 'TFC', 'COF', 'DFS', 'SYF', 'BK', 'STT', 'NTRS', 'AMP', 'RJF', 'LPLA', 'CME', 'ICE', 'NDAQ', 'CBOE', 'MSCI', 'FDS', 'MKTX', 'WTW', 'AJG', 'BRO'
        ],
        'Health Care': [
            'LLY', 'UNH', 'JNJ', 'MRK', 'ABBV', 'PFE', 'TMO', 'DHR', 'ABT', 'BMY', 'AMGN', 'GILD', 'CVS', 'CI', 'ELV', 'HUM', 'CNC', 'MOH', 'HCA', 'UHS', 'THC', 'SYK', 'BSX', 'EW', 'MDT', 'BDX', 'ISRG', 'ZBH', 'BAX', 'ALGN', 'DXCM', 'RMD', 'COO', 'HOLX', 'STE', 'WAT', 'MTD', 'A', 'PKI', 'BIO', 'TECH', 'ILMN', 'VRTX', 'REGN', 'BIIB', 'INCY', 'MRNA'
        ],
        'Industrials': [
            'CAT', 'UNP', 'GE', 'HON', 'UPS', 'BA', 'LMT', 'ADP', 'DE', 'RTX', 'MMM', 'ETN', 'ITW', 'EMR', 'PH', 'CSX', 'NSC', 'FDX', 'WM', 'RSG', 'CTAS', 'PAYX', 'GD', 'NOC', 'LHX', 'HII', 'TXT', 'TDG', 'HEI', 'ROK', 'AME', 'VMI', 'DOV', 'SWK', 'SNA', 'PCAR', 'CMI', 'URI', 'GWW', 'FAST', 'ODFL', 'JBHT', 'CHRW', 'EXPD', 'DAL', 'UAL', 'AAL', 'LUV', 'ALK'
        ],
        'Materials': [
            'LIN', 'SHW', 'APD', 'FCX', 'ECL', 'NEM', 'DOW', 'CTVA', 'NUE', 'PPG', 'VMC', 'MLM', 'ALB', 'FMC', 'MOS', 'CF', 'EMN', 'CE', 'LYB', 'WLK', 'IP', 'WRK', 'PKG', 'AVY', 'BALL', 'AMCR'
        ],
        'Real Estate': [
            'PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'O', 'SPG', 'VICI', 'DLR', 'WELL', 'AVB', 'EQR', 'MAA', 'CPT', 'UDR', 'ESS', 'INVH', 'AMH', 'ARE', 'BXP', 'VNO', 'SLG', 'KIM', 'REG', 'FRT', 'NNN', 'ADC', 'WY', 'IRM', 'EXR', 'CUBE', 'LSI', 'HST', 'MAR', 'HLT'
        ],
        'Utilities': [
            'NEE', 'SO', 'DUK', 'SRE', 'AEP', 'D', 'PEG', 'PCG', 'EXC', 'XEL', 'ED', 'EIX', 'WEC', 'ES', 'DTE', 'ETR', 'FE', 'AEE', 'PPL', 'CMS', 'CNP', 'ATO', 'EVRG', 'LNT', 'NI', 'PNW', 'NRG', 'AES'
        ]
    },
    indices: [
        { symbol: 'SPY', name: 'S&P 500 (US500)' },
        { symbol: 'DIA', name: 'Dow Jones (US30)' },
        { symbol: 'QQQ', name: 'Nasdaq 100 (US100)' },
        { symbol: 'EWU', name: 'FTSE 100 (UK100)' },
        { symbol: 'EWG', name: 'DAX 40 (GER40)' },
        { symbol: 'EWQ', name: 'CAC 40 (FRA40)' },
        { symbol: 'EWJ', name: 'Nikkei 225 (JP225)' },
        { symbol: 'EWH', name: 'Hang Seng (HK50)' },
        { symbol: 'MCHI', name: 'Shanghai Composite (CN50)' },
        { symbol: 'INDA', name: 'BSE Sensex (IND50)' },
        { symbol: 'EWZ', name: 'Ibovespa (Brazil)' }
    ],
    currencies: [
        'XAUSD', // Gold
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'USD/CHF', 'NZD/USD', 'USD/CNY', 'USD/HKD', 'USD/SGD'
    ],
    crypto: [
        'BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD', 'AVAX/USD', 'TRX/USD', 'DOT/USD'
    ]
};
