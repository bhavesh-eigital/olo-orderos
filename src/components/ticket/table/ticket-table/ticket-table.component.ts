import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OloService, Ticket} from '../../../../services/olo.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PageEvent} from '@angular/material/paginator';
import {throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import * as moment from 'dayjs';

@Component({
  selector: 'app-ticket-table',
  templateUrl: './ticket-table.component.html',
  styleUrls: ['./ticket-table.component.scss']
})
export class TicketTableComponent implements OnInit {

  customer: any = [];
  guest: any = 'Guest';
  storeInformation: any;
  paymentInfo: any;
  loading = true;
  dataSource: Ticket[] = [
    {
      ticketId: 156165156,
      status: 'ACTIVE',
      reason: 4,
      created: 1631306603,
      closed: 1631306602,
      refund: {
        orderSubtotal: 25.5,
        tip: 5,
        deliveryFee: 15,
        orderFee: 15,
      }
    },
    {
      ticketId: 516161565,
      status: 'INACTIVE',
      reason: 2,
      created: 1631306701,
      closed: 1631306695,
      refund: {
        orderSubtotal: 25.5,
        tip: 5,
        deliveryFee: 15,
        orderFee: 15,
      }
    }
  ];

  orderId: string;
  limit: number;
  offset: number;
  hasMore: boolean;
  totalCount: number;

  reasons = {
    1: 'Driver never show up',
    2: 'Driver did pick up the order, but customer never received',
    3: 'Driver cancel delivery',
    4: 'Driver was too late for pick up',
    5: 'Driver was too late for dropoff',
    6: 'Driver was rude or unprofessional',
    7: 'Customer wants to change details about delivery',
    8: 'Driver returned delivery back to the store',
    9: 'Question about invoicing or billing of this delivery',
    10: 'Other reasons not specified above',
  };

  displayedColumns = [
    'ticketId',
    'status',
    'contactReason',
    'dateCreated',
    'dateClosed',
    'refundOrderSubtotal',
    'refundTip',
    'refundDeliveryFee',
    'refundOrderFee'
  ];


  constructor(
    private router: Router,
    public oloService: OloService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParams?.orderId;
    this.getTicket(this.orderId, 10, 1);
  }

  goBack() {
    this.router.navigate(['home']);
  }

  getTime = (date) => {
    return moment((date * 1000)).format('ll');
  }

  getPage($event: PageEvent) {
    this.loading = !this.loading;
    this.limit = $event.pageSize;
    this.offset = $event.pageSize * $event.pageIndex;
    this.getTicket(this.orderId, this.limit, (!this.offset ? 1 : this.offset));
  }

  getTicket(orderId, first, after) {
    this.oloService.getTickets(orderId, first, after).pipe(
      tap(({success, response, message, totalCount, hasMore}) => {
        if (success === 1) {
          this.dataSource = response;
          this.hasMore = hasMore;
          this.totalCount = totalCount;
        } else {
          this.openSnackBar(message, 2);
        }
        this.loading = !this.loading;
      }),
      catchError(err => {
        this.loading = !this.loading;
        this.openSnackBar(err.error.message, 2);
        return throwError( err );
      })
    ).subscribe();
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
