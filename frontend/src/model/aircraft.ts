export interface AddDrone {
  name: string;
  modelName: string;
  serial: string;
}

export interface Drone {
  _id: string;
  name: string;
  modelName: string;
  serial: string;
  createdAt: string;
}

export interface Aircraft {
  aircraftsData: Drone[];
  fetchDrones: () => Promise<void>;
  editDrone: (updates: Drone) => Promise<void>;
  deleteDrone: (id: string) => Promise<void>;
  addDrone: (drone: AddDrone) => Promise<void>;
}
