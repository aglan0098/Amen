export interface Column {
  key: string;
  label: string;
  // optional templateRef for custom render
  template?: any;
}

export interface TableResponse {
  data: any[];
  recordsTotal: number;
  recordsFiltered?: number;
}
