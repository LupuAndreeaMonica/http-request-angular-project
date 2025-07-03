import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';

import { Place } from '../place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})

export class UserPlacesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  isFetching = signal(false);
  error = signal('')
  private placesService = inject(PlacesService);
  places = this.placesService.loadedUserPlaces;

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.placesService.loadUserPlaces().subscribe({
        complete: () => {
          this.isFetching.set(false)
        },
        error: (error: Error) => {
          this.error.set(error.message)
        }
      });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }

  removeUserPlace(place: Place){
    const subscription = this.placesService.removeUserPlace(place).subscribe({
      complete: () => {
        console.log('deteted complete')
      },
      error: (error: Error) => {
        this.error.set(error.message)
      }
    })
    
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }
}
