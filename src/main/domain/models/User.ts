export interface UserData {
  id?: string;
  email: string;
  password?: string;
  createdAt?: Date;
}

export class User {
  id?: string;
  email: string;
  password?: string;
  createdAt?: Date;

  constructor({ id, email, password, createdAt }: UserData) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }
}
