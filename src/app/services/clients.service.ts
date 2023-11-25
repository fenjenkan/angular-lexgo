import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  public header: any
  constructor(private http: HttpClient,) {
    this.header = new HttpHeaders({
      'content-type': 'application/json',
      
  });
   }  

  public index(params: any, destination: string) {
    let queries: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach(el => queries.push(`${key}[]=${el}`));
      } else {
        if (value != null) {
          if (typeof value === 'string' || typeof value === 'number') queries.push(`${key}=${value}`);
          if (typeof value === 'boolean') queries.push(`${key}=${value ? 1 : 0}`);
        }
      }
    }
  
    return this.http.get(`http://localhost:3000/${destination}?${ queries.join('&')}`, { headers: this.header }).pipe(
      tap(res => { return res }),
      catchError(err => { return throwError(err) })
    );
  }
  public store(values: any, destination: string) {
    return this.http.post(`http://localhost:3000/${destination}`, values, { headers: this.header }).pipe(
      tap(res => { return res }),
      catchError(err => { return throwError(err) })
    );
  }
  public show(id: string,destination:string) {
    return this.http.get(`http://localhost:3000/${destination}/${id}`).pipe(
      tap(res => { return res }),
      catchError(err => { return throwError(err) })
    );
  }
  public update(id: string,destination:string, values: any) {
    return this.http.put(`http://localhost:3000/${destination}/${ id }`, values ,{ headers: this.header }).pipe(
        tap(res => { return res }),
        catchError(err => { return throwError(err) })
    );
}
public destroy(id: string) {
  return this.http.delete(`http://localhost:3000/${ id }` ,{ headers: this.header }).pipe(
      tap(res => { return res }),
      catchError(err => { return throwError(err) })
  );
}
}
