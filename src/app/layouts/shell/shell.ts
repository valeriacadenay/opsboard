import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-shell',
  imports: [],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {

}
