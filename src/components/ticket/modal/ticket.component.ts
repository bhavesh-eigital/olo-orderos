import {Component, Inject, OnInit} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {OloService} from '../../../services/olo.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {

  reasons = [
    {id: 1, reason: 'Driver never show up'},
    {id: 2, reason: 'Driver did pick up the order, but customer never received'},
    {id: 3, reason: 'Driver cancel delivery'},
    {id: 4, reason: 'Driver was too late for pick up'},
    {id: 5, reason: 'Driver was too late for dropoff'},
    {id: 6, reason: 'Driver was rude or unprofessional'},
    {id: 7, reason: 'Customer wants to change details about delivery'},
    {id: 8, reason: 'Driver returned delivery back to the store'},
    {id: 9, reason: 'Question about invoicing or billing of this delivery'},
    {id: 10, reason: 'Other reasons not specified above'},
  ];

  note = '';
  ticketForm: FormGroup;
  isTicketSuccess: boolean;
  isRequestMade: boolean;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customerId: string, deliveryId: string },
    private dialog: MatDialog,
    private oloService: OloService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.ticketForm = this.fb.group({
      mail: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      mailCC: ['', [Validators.email]],
      reason: [null, [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  getReason($event: MatSelectChange) {

  }

  closeModal() {
    this.dialogRef.close();
  }

  sendTicket() {

  }

  onSubmit() {
    const { value } = this.ticketForm;
    this.isRequestMade = !this.isRequestMade;
    this.oloService.createTicket(this.data.customerId, this.data.deliveryId,
      value.mail, [value.mailCC], value.reason, value.description).pipe(
        tap(({success, response, message}) => {
          if (success === 1) {
            this.isTicketSuccess = !this.isTicketSuccess;
            this.openSnackBar(response.message, 1);
          } else {
            this.openSnackBar(message, 2);
          }
          this.isRequestMade = !this.isRequestMade;
        })
    ).subscribe();
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }


}
