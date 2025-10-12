import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnChanges {
  @Input() value = '';
  @Input() placeholder = 'بحث...';
  @Input() debounceMs = 400;
  @Output() valueChange = new EventEmitter<string>();

  control = new FormControl('');

  ngOnInit() {
    this.control.setValue(this.value);
    this.control.valueChanges.pipe(debounceTime(this.debounceMs)).subscribe((v) => {
      this.valueChange.emit(v ?? '');
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && !changes['value'].firstChange) {
      this.control.setValue(this.value, { emitEvent: false });
    }
  }
}
