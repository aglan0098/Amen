import { TableResponse } from "../models/table.model";

export const mockData: TableResponse & { draw?: number } = {
  draw: 1,
  recordsTotal: 7,
  recordsFiltered: 7,
  data: [
    { id: 1, name: "محكمة A", location: "المنطقة 1" },
    { id: 2, name: "محكمة B", location: "المنطقة 2" },
    { id: 3, name: "محكمة C", location: "المنطقة 3" },
    { id: 4, name: "محكمة D", location: "المنطقة 4" },
    { id: 5, name: "محكمة E", location: "المنطقة 5" },
    { id: 6, name: "محكمة F", location: "المنطقة 6" },
    { id: 7, name: "محكمة G", location: "المنطقة 7" },
  ]
};
