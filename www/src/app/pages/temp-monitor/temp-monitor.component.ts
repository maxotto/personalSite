import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import * as c3 from 'c3';
import {ThingSpeakConfig, ThingSpeakService} from '../../@core/services/thing-speak.service';
import {GlobalParams} from '../../params';
import {Time} from '@angular/common';

@Component({
  selector: 'app-temp-monitor',
  templateUrl: './temp-monitor.component.html',
  styleUrls: ['./temp-monitor.component.css']
})
export class TempMonitorComponent implements OnInit, OnDestroy {
  chart: any;
  channel: {};
  feeds = [];
  interval: any;
  timescale = 30;
  days = 3;
  height = 800;
  constructor(private tss: ThingSpeakService) {
    this.timescale = GlobalParams.THINGSPEAK_API_TIMESCALE;
    this.days = GlobalParams.THINGSPEAK_API_DAYS;
  }

  ngOnInit() {
    this.height = window.innerHeight - 245;
    this.updateData();
    this.interval = setInterval(() => {
      const date = new Date();
      const minutes = date.getMinutes();
      if (minutes === 3 || (minutes % this.timescale) === 3 ) {
        this.updateData();
      }
    }, 60000);
  }
  onResize(event) {
    // console.log(event);
    // console.log(event.target);
    this.height = event.target.innerHeight - 245;
    this.chart.resize({height: event.target.innerHeight - 245});
  }
  ngOnDestroy() {
    clearInterval(this.interval);
  }
  public updateData() {
    const config = new ThingSpeakConfig();
    config.apiReadKey = GlobalParams.THINGSPEAK_API_READ_KEY;
    config.days = this.days;
    config.timescale = this.timescale;
    this.tss.getData(config).subscribe(
      responce => {
        this.channel = responce.channel;
        this.feeds = responce.feeds;
        const chartData = this.composeChartData();
        this.chart = c3.generate({
          bindto: '#chart',
          data: chartData,
          axis: {
            x: {
              type: 'timeseries',
              label: 'Время',
              tick: {
                format: '%d.%m.%Y, %H:%M:%S'
              }
            },
            y: {
              label: {
                text: 'Температура по Цельсию',
                position: 'outer-middle'
              }
            },
          }
        });
      },
      error => {
        console.log(error);
      }
    );
  }
  composeChartData() {
    const data = {
      x: 'x',
      xFormat: '%Y-%m-%dT%H:%M:%S', // how the date is parsed
      columns: [],
      types: {},
      names: {}
    };
    const myFields = [
      'x',
      'field1',
      'field2',
      'field3',
    ];
    for (const fieldIndex in myFields) {
      if (myFields.hasOwnProperty(fieldIndex)) {
        data.columns.push([myFields[fieldIndex]]);
        if (fieldIndex !== '0') {
          data.types[myFields[fieldIndex]] = 'area-spline';
          data.names[myFields[fieldIndex]] = this.channel[myFields[fieldIndex]];
        }
      }
    }
    for (const feed of this.feeds) {
      for (const fieldIndex in myFields) {
        if (myFields.hasOwnProperty(fieldIndex)) {
          const index = data.columns[fieldIndex][0];
          if (fieldIndex !== '0') {
            const value = feed[index];
            data.columns[fieldIndex].push(value);
          } else {
            const value = feed['created_at'].substring(0, 19);
            const d = new Date(value);
            const timeZone = (-1) * d.getTimezoneOffset() / 60;
            d.setUTCHours(d.getUTCHours() + timeZone);
            const date =
              d.getFullYear() + '-' +
              ('00' + (d.getMonth() + 1)).slice(-2) + '-' +
              ('00' + d.getDate()).slice(-2) + 'T' +
              ('00' + d.getHours()).slice(-2) + ':' +
              ('00' + d.getMinutes()).slice(-2) + ':' +
              ('00' + d.getSeconds()).slice(-2);
            data.columns[fieldIndex].push(date);
          }
        }
      }
    }
    return data;
  }


}
