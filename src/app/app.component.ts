import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TitleService } from './services/title/title.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'SEA - COBACH';

  constructor(private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.init();
  }
}
