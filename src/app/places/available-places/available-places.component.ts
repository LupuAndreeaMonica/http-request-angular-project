import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  private destroyRef = inject(DestroyRef);
  isFetching = signal(false);
  error = signal('')
  private placesService = inject(PlacesService)

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.placesService.loadAvailablePlaces()
    .subscribe({
      next: (places) => {
        console.log(places)
        this.places.set(places)
      },
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

    //  const subscription = this.httpCLient.get<{ places: Place[] }>('http://localhost:3000/places', {observe: 'response'}).subscribe({
    //   // next: (respData) => { console.log(respData.places) }
    //   next: (response) => {
    //     console.log(response)
    //     console.log(response.body?.places)
    //   }
    // });
    // this.destroyRef.onDestroy(() => {
    //   subscription.unsubscribe();
    // })
  }
  onSelectPlace(selectedPlace: Place) {
    const subscription = this.placesService.addPlaceToUserPlaces(selectedPlace).subscribe({
      next: (respData) => console.log(respData)
    });
    
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }
}
