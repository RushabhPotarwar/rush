import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateScheduleService {

  constructor(private http: HttpClient) { }

 onLoadData(Date: string){
  let data = {
    "fromDate": Date
  }

    try {
      const url = "https://localhost:7266/FinIQ/api/GetDateSchedule_Records"
      
      return this.http.post<any>(url,data);
    } 
    catch (error) {
      console.log("Error");
      
    }
 }

}
