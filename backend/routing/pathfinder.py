import heapq
import numpy as np

def astar_pathfinding(navmap, start, goal):
    """Simple 8-connected A* pathfinding on binary map."""
    h, w = navmap.shape
    open_set = [(0, start)]
    came_from = {}
    g_score = {start: 0}
    neighbors = [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]

    def heuristic(a, b):
        return abs(a[0]-b[0]) + abs(a[1]-b[1])

    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            return path[::-1]
        for dr, dc in neighbors:
            nr, nc = current[0]+dr, current[1]+dc
            if 0 <= nr < h and 0 <= nc < w and navmap[nr, nc] == 1:
                cost = 1.0 if abs(dr)+abs(dc)==1 else 1.4
                tentative_g = g_score[current] + cost
                if tentative_g < g_score.get((nr,nc), float("inf")):
                    came_from[(nr,nc)] = current
                    g_score[(nr,nc)] = tentative_g
                    f = tentative_g + heuristic((nr,nc), goal)
                    heapq.heappush(open_set, (f, (nr,nc)))
    return []
