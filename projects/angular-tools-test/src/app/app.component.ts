import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LOGO_BASE64 } from './app.constant';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  protected readonly logoBase64: string = LOGO_BASE64;
}
