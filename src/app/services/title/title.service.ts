import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private baseTitle = 'SEA - COBACH';

  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  init() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        map(route => route.snapshot.data['title'] || this.baseTitle)
      )
      .subscribe(title => {
        this.title.setTitle(`${title} | ${this.baseTitle}`);
      });
  }

  setTitle(title: string) {
    this.title.setTitle(`${title} | ${this.baseTitle}`);
  }
}