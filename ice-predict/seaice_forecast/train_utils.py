import torch
import torch.nn.functional as F

def dice_loss(pred, target, eps=1e-6):
    inter = (pred * target).sum()
    union = pred.sum() + target.sum()
    dice = (2 * inter + eps) / (union + eps)
    return 1 - dice

def train_epoch(model, loader, opt, device):
    model.train()
    total_loss = 0
    for X, y in loader:
        X, y = X.to(device), y.to(device)
        X = X.transpose(1, 2)  # (B,1,seq,H,W)
        out = model(X)
        loss = F.binary_cross_entropy(out, y) + dice_loss(out, y)
        opt.zero_grad()
        loss.backward()
        opt.step()
        total_loss += loss.item()
    return total_loss / len(loader)

def validate_epoch(model, loader, device):
    model.eval()
    total_loss = 0
    with torch.no_grad():
        for X, y in loader:
            X, y = X.to(device), y.to(device)
            X = X.transpose(1, 2)
            out = model(X)
            loss = F.binary_cross_entropy(out, y) + dice_loss(out, y)
            total_loss += loss.item()
    return total_loss / len(loader)
