export interface MyRequest extends Request {
  user: {
    id: number;
    username: string;
  };
}
