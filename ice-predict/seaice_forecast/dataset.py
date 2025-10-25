import re
from datetime import datetime
from pathlib import Path
import numpy as np
import torch
from torch.utils.data import Dataset
import rasterio

DATE_RE = re.compile(r"N_(\d{4})(\d{2})(\d{2})_extent_v4\.0\.tif$")

def parse_date(p: Path):
    m = DATE_RE.search(p.name)
    if not m:
        return None
    y, mth, d = map(int, m.groups())
    return datetime(y, mth, d)

class SeaIceDataset(Dataset):
    def __init__(self, root_dir: str, seq_len: int = 6, radius_km: float = 200, years_range=(1978, 2025)):
        self.root_dir = Path(root_dir)
        self.seq_len = seq_len
        self.radius_km = radius_km

        files = sorted(self.root_dir.rglob("*.tif"))
        pairs = []
        for f in files:
            dt = parse_date(f)
            if not dt:
                continue
            if years_range[0] <= dt.year <= years_range[1]:
                pairs.append((dt, f))
        pairs.sort(key=lambda x: x[0])
        self.files = [f for _, f in pairs]
        self.dates = [dt for dt, _ in pairs]

        # 获取 transform（计算极点距离）
        with rasterio.open(self.files[0]) as src:
            h, w = src.height, src.width
            transform = src.transform
        cols, rows = np.meshgrid(np.arange(w), np.arange(h))
        xs = transform.c + cols * transform.a + rows * transform.b
        ys = transform.f + cols * transform.d + rows * transform.e
        self.dist_km = np.sqrt(xs**2 + ys**2) / 1000
        self.indices = [i for i in range(seq_len, len(self.files))]

    def __len__(self):
        return len(self.indices)

    def _read_frame(self, path: Path):
        with rasterio.open(path) as src:
            arr = src.read(1)
        seaice = (arr == 1).astype(np.float32)
        land = (arr == 254).astype(np.float32)
        border = (arr == 253).astype(np.float32)

        # 挖空极点附近
        mask = self.dist_km < self.radius_km
        seaice[mask] = 0
        land[mask] = 0
        border[mask] = 0

        return np.stack([seaice, land, border], axis=0)  # (3, H, W)

    def __getitem__(self, idx):
        t = self.indices[idx]
        seq_files = self.files[t - self.seq_len : t]
        target_file = self.files[t]

        seq = np.stack([self._read_frame(f) for f in seq_files], axis=0)  # (seq, 3, H, W)
        target = self._read_frame(target_file)[0]  # 只取海冰通道作为目标

        X = torch.tensor(seq, dtype=torch.float32)  # (seq, 3, H, W)
        y = torch.tensor(target, dtype=torch.float32).unsqueeze(0)  # (1, H, W)
        return X, y

