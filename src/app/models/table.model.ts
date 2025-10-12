export interface Column {
  key: string;
  label: string;
  // optional templateRef for custom render
  template?: any;
}

export interface TableResponse {
  draw?: number;
  data: any[];
  recordsTotal: number;
  recordsFiltered?: number;
}
