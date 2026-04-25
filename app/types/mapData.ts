export interface RegionStats {
  totalPrograms: number;
  totalApplications: number;
  openPrograms: number;
  approvedApplications: number;
}

export interface MapData {
  id: string;
  regionName: string;
  stats: RegionStats;
}
