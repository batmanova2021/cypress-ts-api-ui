export interface UserTemplate {
  name: string;
  password: string;
  title: string;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

export interface TestUser extends UserTemplate {
  email: string;
}

export type Credentials = Pick<TestUser, 'email' | 'password'>;

export interface RegressionData {
  searchTerm: string;
  noMatchSearch: string;
  incorrectPassword: string;
  quantity: number;
  updatedName: string;
  updatedCity: string;
}

export interface ApiResult {
  responseCode: number;
  message?: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: { category: string; usertype: { usertype: string } };
}

export interface ProductsResponse extends ApiResult {
  products: Product[];
}

export interface UserResponse extends ApiResult {
  user: { name: string; email: string; city: string };
}

export interface ProductDetails {
  name: string;
  price: string;
}
