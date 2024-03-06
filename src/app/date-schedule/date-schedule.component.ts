import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DateScheduleService } from './date-schedule.service';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-schedule',
  templateUrl: './date-schedule.component.html',
  styleUrl: './date-schedule.component.css'
})
export class DateScheduleComponent implements OnInit {

  constructor(private dateService: DateScheduleService, private datepipe: DatePipe){}

  ngOnInit(): void {
    this.dateNotSelected=false;
  }

  @ViewChild('fileimport') myFile: ElementRef;


  //selected data for post request for fetching data 
  selectedDate: string="";

  //exception handling variables
  noDataFound =false;
  dateNotSelected = false;
  noRecords=false;

  
//excel import data 
  excelData: any[] = [];

  //formatted data for display purpose
  formattedExcelData : any[] = []
searchData: any = {};

filteredData: object[] = this.formattedExcelData;

  filterData(): void {
    this.filteredData = this.formattedExcelData.filter(entry => {
      for (let key in this.searchData) {
        if (this.searchData[key] && entry[key]) {
          
          if (!entry[key].toLowerCase().includes(this.searchData[key].toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });
  }

  clearFilters(): void {
    this.searchData = {};
    this.filterData();
  }


  //Date conversion from excel Date to JSON Date
  td: Date

  //Single row entry 
  singleEntry : {
    Freq_Type: string;
    Country: string;
    CounterParty: string;
    TradeDate: string;
    Tenor:string;
    StartDays:string;
    SettlementCycle:string;
    Period_Start:string;
    Period_End:string;
    Period_Settle:string;
    Exch_B_Days:string;
  }


  //repeating parameters from excel import
  freqType1=""
  country1=""
  tradeDate1=""
  tenor1=""
  start1=""



 
//All Required headers 
  theads = ['Frequency Type',
            'Country',	
            'Counter Party',	
            'Trade Date',	
            'Tenor',	
            'Start Days',	
            'Settlement Cycle',	
            'Period Start',	
            'Period End',	
            'Period Settle',	
            'Exch B Days']



//Excel to Json conversion--------------------------------------------------------------------------------------------------------------------------------------------------------
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    const reader = new FileReader();

    reader.onload = (e: any) => {
        // Get binary string from the loaded file
        const data: string = e.target.result;

        // Convert binary string to workbook
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });

        // Get the first sheet name
        const sheetName: string = workbook.SheetNames[0];

        // Get worksheet
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Do something with jsonData, like send it to a server or process it further
        this.excelData = jsonData;
      };
      
      reader.readAsBinaryString(file);
    }
    
  //IMPORT button click
  onImport(){
    this.noDataFound=false;
    this.dateNotSelected=false;
    this.formatImportedData();
  }



  //Formatting the data inported from excel file
  formatImportedData(){

    try{
      this.noRecords=false;
      this.freqType1=this.excelData[0][0];

      //Bi-Weekly Data
      for(let i=1; i<this.excelData.length; i++){
        
        this.country1=this.excelData[i][0];

      //Trade Sate Conversion--> Start
        this.td =this.convertExcelDateToJSDate(this.excelData[i+1][1]);
        const day = String(this.td.getDate()).padStart(2, '0'); // Get day (with padding)
        const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(this.td); // Get month abbreviation
        const year = this.td.getFullYear(); // Get full year
      //Trade Sate Conversion--> END

        this.tradeDate1= `${day}-${month}-${year}`;

        
        this.start1=this.excelData[i+2][1];
        this.tenor1=this.excelData[i+3][1];

        let previ=i;
        i=i+4;

        for(let j=0; j<Number(this.excelData[previ+4][0]); j++){

          this.formattedExcelData.push({Freq_Type: this.freqType1,Country: this.country1,CounterParty: "", TradeDate: this.tradeDate1,Tenor: this.tenor1, StartDays: this.start1, SettlementCycle: (j+1).toString(), Period_Start: this.excelData[i+1][1], Period_End: this.excelData[i+1][2], Period_Settle: this.excelData[i+1][3], Exch_B_Days: this.excelData[i+1][4]});
          i++;

        }

        i=i+2;
      }

      //Monthly Data

      this.freqType1=this.excelData[0][6];


      for(let i=1; i<this.excelData.length; i++){
        
        this.country1=this.excelData[i][6];
        if(this.country1==""){
          console.log("Hello");
          console.log(this.excelData[i][6]);
          break;
        }

      //Trade Sate Conversion--> Start
        this.td =this.convertExcelDateToJSDate(this.excelData[i+1][1]);
        const day = String(this.td.getDate()).padStart(2, '0'); // Get day (with padding)
        const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(this.td); // Get month abbreviation
        const year = this.td.getFullYear(); // Get full year

        this.tradeDate1= `${day}-${month}-${year}`;
      //Trade Sate Conversion--> END

        this.start1=this.excelData[i+2][7];
        this.tenor1=this.excelData[i+3][7];

        let previ=i;
        i=i+4;

        for(let j=0; j<Number(this.excelData[previ+4][6]); j++){
          this.formattedExcelData.push({Freq_Type: this.freqType1,Country: this.country1,CounterParty: "", TradeDate: this.tradeDate1,Tenor: this.tenor1, StartDays: this.start1, SettlementCycle: (j+1).toString(), Period_Start: this.excelData[i+1][7], Period_End: this.excelData[i+1][8], Period_Settle: this.excelData[i+1][9], Exch_B_Days: this.excelData[i+1][10]});
          i++;
        }


        i=i+3;
        
      }
    }catch{
      // alert("Invalid File Format");
    }

    
  }

  //Convert Date from Excel format to Json String. In formatImportedData Function
  convertExcelDateToJSDate(excelDate: number): Date {
    return new Date((excelDate - 25569) * 86400 * 1000);
  }


//Load Data From DataBase
  onLoad(){
    this.noDataFound=false;
    
    try{
      if(this.selectedDate===""){
        this.dateNotSelected=true;
        return;
      }
      this.dateService.onLoadData(this.selectedDate).subscribe(responseData=>{
        this.formattedExcelData=responseData;

        this.formattedExcelData.sort((a, b) => {
          if (a.Freq_Type === b.Freq_Type) {
            return a.Country.localeCompare(b.Country); // If column1 is equal, compare column2
          }
          return a.Freq_Type.localeCompare(b.Freq_Type); // Otherwise, compare column1
        });

        //Date Formatting of received Data
        this.onFormat();

        //No data for respective date is found
        if(this.formattedExcelData.length<=0){
          this.noDataFound=true;
        }
      })

    }
    catch{
      this.noDataFound=true;
    }
    
  }

  //On changing scheduled date
  onDateChange(){
    this.noDataFound=false;
    this.dateNotSelected=false;
  }

  //formatting data fetched from DB
  onFormat(){
    for(let i=0; i<this.formattedExcelData.length; i++){
      const data = this.formattedExcelData[i].TradeDate;

      const parsedDate = new Date(data);
      this.formattedExcelData[i].TradeDate = this.datepipe.transform(parsedDate, 'dd-MMM-yyyy');

    }

    for(let i=0; i<this.formattedExcelData.length; i++){
      const data = this.formattedExcelData[i].Period_Start;

      const parsedDate = new Date(data);
      this.formattedExcelData[i].Period_Start = this.datepipe.transform(parsedDate, 'dd-MMM-yyyy');

    }

    for(let i=0; i<this.formattedExcelData.length; i++){
      const data = this.formattedExcelData[i].Period_End;

      const parsedDate = new Date(data);
      this.formattedExcelData[i].Period_End = this.datepipe.transform(parsedDate, 'dd-MMM-yyyy');

    }

    for(let i=0; i<this.formattedExcelData.length; i++){
      const data = this.formattedExcelData[i].Period_Settle;

      const parsedDate = new Date(data);
      this.formattedExcelData[i].Period_Settle = this.datepipe.transform(parsedDate, 'dd-MMM-yyyy');

    }
  }

}
