import type { MRT_ColumnDef } from "material-react-table";
import type { ColumnDef } from "~/components/tables/GenericTable";

export interface User {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Utility function to transform the api data to an instance of User
export function parseDataToUser(data: Record<string, any>): User {
    return {
        id: data.id,
        username: data.username,
        email: data.email,
        isAdmin: data.isAdmin,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
    }
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export function getUserColumns(): ColumnDef<User>[] {
  return [
    {
      key: 'id',
      header: 'ID',
      searchable: true,
    },
    {
      key: 'email',
      header: 'Email',
      searchable: true
    },
    {
      key: 'username',
      header: 'Username',
      searchable: true
    },
    {
      key: 'createdAt',
      header: 'Created at',
      cellRenderer: (usr) => {
        return usr?.createdAt.toLocaleDateString()
      },
    },
    {
      key: 'isAdmin',
      header: 'Admin',
      cellRenderer: (usr) => {
        return usr.isAdmin ? "Yes" : "No"
      },
    }
  ]
}