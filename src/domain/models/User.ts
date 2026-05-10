export interface UserData {
  id?: string | number;
  email: string;
  password?: string;
}

export class User {
  id?: string | number;
  email: string;
  password?: string;

  constructor({ id, email, password }: UserData) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}
