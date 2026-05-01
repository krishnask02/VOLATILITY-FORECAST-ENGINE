import datetime

# Configuration mapping

# Asset specifications
TARGET_TICKER = 'GOOG'
MACRO_TICKER = '^VIX'
INTERVAL = '5m'

# yfinance allows max 60 days for 5m interval
END_DATE = datetime.datetime.now().strftime('%Y-%m-%d')
START_DATE = (datetime.datetime.now() - datetime.timedelta(days=59)).strftime('%Y-%m-%d')

# Data Processing defaults
GARCH_ROLLING_WINDOW = 21

# Neural Network Hyperparameters
NN_EPOCHS = 100
NN_BATCH_SIZE = 64
NN_LEARNING_RATE = 0.001
NN_HIDDEN_1 = 64
NN_HIDDEN_2 = 32

# Simulation
MONTE_CARLO_SIMS = 1000
MONTE_CARLO_HORIZON = 21
