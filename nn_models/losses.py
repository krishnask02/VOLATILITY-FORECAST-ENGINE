import torch
import torch.nn as nn
import torch.nn.functional as F

class QLIKELoss(nn.Module):
    """
    Quasi-Likelihood loss function.
    Highly asymmetric, heavily penalizes under-prediction of volatility.
    QLIKE(pred, true) = true/pred - log(true/pred) - 1
    """
    def __init__(self):
        super(QLIKELoss, self).__init__()

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        # Add epsilon to prevent division by zero or log(0)
        eps = 1e-8
        pred = pred + eps
        target = target + eps
        
        ratio = target / pred
        loss = ratio - torch.log(ratio) - 1
        return torch.mean(loss)

def get_loss_function(name: str):
    if name.lower() == 'mse':
        return nn.MSELoss()
    elif name.lower() == 'qlike':
        return QLIKELoss()
    else:
        raise ValueError(f"Unknown loss function {name}")
