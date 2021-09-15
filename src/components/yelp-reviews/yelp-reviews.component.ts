import { Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Review } from '../Cover-Page/CoverPage';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-yelp-reviews',
  templateUrl: './yelp-reviews.component.html',
  styleUrls: ['./yelp-reviews.component.scss']
})
export class YelpReviewsComponent {

  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  constructor(
    private matDialogRef: MatDialogRef<YelpReviewsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reviews: Review[], totalReviews: number, yelpUrl: string },
    private renderer: Renderer2
  ) { }

  goToUserProfile(review: Review) {
    this.blankRedirection(review.user.profile_url);
  }

  redirectToCommentPage(review: Review) {
    this.blankRedirection(review.url);
  }


  close() {
    this.matDialogRef.close();
  }

  blankRedirection(url: string) {
    const a = this.renderer.createElement('a');
    this.renderer.setAttribute(a, 'href', url);
    this.renderer.setAttribute(a, 'target', '_blank');
    a.click();
    this.renderer.appendChild(this.container.nativeElement, a);
    this.renderer.removeChild(this.container.nativeElement, a);
  }

  parseDate(review:Review) {
    return dayjs(review.time_created).format('DD/MM/YYYY');
  }

  goToYelp() {
    this.blankRedirection(this.data.yelpUrl);
  }
}
