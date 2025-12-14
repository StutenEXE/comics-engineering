import type { MRT_ColumnDef } from "material-react-table";

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

export function getUserMRTColumns(): MRT_ColumnDef<User>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 50,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 150,
    },
    {
      accessorKey: 'username',
      header: 'Username',
      size: 150,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created at',
      size: 150,
      Cell: ({ cell }) => {
        return cell.getValue<Date>()?.toLocaleDateString()
      },
    },
    {
      accessorKey: 'isAdmin',
      header: 'Admin',
      size: 50,
      Cell: ({ cell }) => {
        return cell.getValue<boolean>() ? "Yes" : "No"
      },
    }
  ]
}