import torch
import torch.nn.functional as F

# ---------------------- 通用部分 ----------------------
def dice_loss(pred, target, eps=1e-6):
    inter = (pred * target).sum()
    union = pred.sum() + target.sum()
    dice = (2 * inter + eps) / (union + eps)
    return 1 - dice

def masked_loss(out, y, land, border):
    """计算掩膜后的 BCE + Dice loss"""
    valid_mask = ((land == 0) & (border == 0)).unsqueeze(1)  # (B,1,H,W)
    out_masked = out[valid_mask]
    y_masked = y[valid_mask]
    loss = F.binary_cross_entropy(out_masked, y_masked) + dice_loss(out_masked, y_masked)
    return loss

# ---------------------- 训练阶段 ----------------------
def train_epoch(model, loader, opt, device):
    model.train()
    total_loss = 0
    for X, y in loader:
        X, y = X.to(device), y.to(device)
        X = X.transpose(1, 2)  # (B, 3, seq, H, W)
        out = model(X)

        land = X[:, 1, -1, :, :]
        border = X[:, 2, -1, :, :]
        loss = masked_loss(out, y, land, border)

        opt.zero_grad()
        loss.backward()
        opt.step()
        total_loss += loss.item()
    return total_loss / len(loader)

# ---------------------- 验证阶段 ----------------------
def validate_epoch(model, loader, device):
    model.eval()
    total_loss = 0
    with torch.no_grad():
        for X, y in loader:
            X, y = X.to(device), y.to(device)
            X = X.transpose(1, 2)
            out = model(X)

            land = X[:, 1, -1, :, :]
            border = X[:, 2, -1, :, :]
            loss = masked_loss(out, y, land, border)

            total_loss += loss.item()
    return total_loss / len(loader)
