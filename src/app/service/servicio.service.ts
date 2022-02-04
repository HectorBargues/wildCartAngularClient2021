import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, httpOptions } from 'src/environments/environment';
import { IPageServicio, IServicio, IServicio2Send } from '../model/servicio-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  sURL = API_URL + '/servicio';

  constructor(private http: HttpClient) { }

  get(id: number): Observable<IServicio> {
    return this.http.get<IServicio>(this.sURL + "/" + id, httpOptions);
  }

  removeOne(id: number): Observable<IServicio> {
    return this.http.delete<IServicio>(this.sURL + "/" + id, httpOptions);
  }

  newOne(oProduct: IServicio2Send): Observable<IServicio> {
    return this.http.post<IServicio>(this.sURL + "/", oProduct, httpOptions);
  }

  update(oProduct: IServicio2Send): Observable<IServicio> {
    return this.http.put<IServicio>(this.sURL + "/", oProduct, httpOptions);
  }

  getPage(rpp: number, page: number, filter: string, order: string, direction: string, tiposervicio: number): Observable<IPageServicio> {
    let strOrderUrl: string = "";
    if (order) {
      strOrderUrl += "&sort=" + order + "," + direction;
    }
    if (filter) {
      strOrderUrl += "&filter=" + filter;
    }
    if (tiposervicio) {
      strOrderUrl += "&tiposervicio=" + tiposervicio;
    }
    return this.http.get<IPageServicio>(this.sURL + "?page=" + (page - 1) + "&size=" + rpp + strOrderUrl, httpOptions);
  }
}