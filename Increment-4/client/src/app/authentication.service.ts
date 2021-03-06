import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface UserDetails {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  exp: number;
  iat: number;
}

export interface MovieDetails {
  m_id: string;
  m_url: string;
  m_cover: string;
  m_cast: Array<string>;
  m_name: string;
  m_release: string;
  m_genre: Array<string>;
  m_score: number;
  m_positive: number;
  m_wpositive: number;
  m_spositive: number;
  m_negative: number;
  m_wnegative: number;
  m_snegative: number;
  m_neutral: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthenticationService {
  private token: string;

  constructor(private http: HttpClient, private router: Router) {}

  private saveToken(token: string): void {
    localStorage.setItem('usertoken', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('usertoken');
    }
    return this.token;
  }

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  public register(user: TokenPayload): Observable<any> {
    const base = this.http.post(`/users/register`, user);

    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );

    return request;
  }

  public login(user: TokenPayload): Observable<any> {
    const base = this.http.post(`/users/login`, user);

    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        } else {
          alert('Please enter valid email/password');
        }
        return data;
      })
    );

    return request;
  }

  public profile(): Observable<any> {
    return this.http.get(`/users/profile`, {
      headers: { Authorization: ` ${this.getToken()}` }
    });
  }

  public movieboard(): Observable<any> {
    return this.http.get(`/movies/list`, {
      headers: { Authorization: ` ${this.getToken()}` }
    });
  }

  public search(keyword): Observable<any> {
    return this.http.post(`/movies/search`, 'keyword=' + keyword , {
      headers: { 'Content-Type': `application/x-www-form-urlencoded` }
    });
  }

  public details(id): Observable<any> {
    return this.http.post(`/movies/details`, 'id=' + id , {
      headers: { 'Content-Type': `application/x-www-form-urlencoded` }
    });
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('usertoken');
    this.router.navigateByUrl('/');
  }

}
