import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient)
  private userPlaces = signal<Place[]>([]);
  private errorService = inject(ErrorService)

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', 'Sth went wrong fetching plaes')
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places', 'Sth went wrong fetching fav plaes')
    .pipe(tap({
      next: (userPlaces) => this.userPlaces.set(userPlaces)
    }))
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();
    // this.userPlaces.update(prevPlaces => [...prevPlaces, place]);

    if(!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place])
    }

    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id
    })
    .pipe(
      catchError(error => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('failed to store')
        return throwError(() => new Error('failed to store'))
      })
    )
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();

    if(prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter( p => p.id !== place.id))
    }

    return this.httpClient.delete('http://localhost:3000/user-places/' + place.id)
    .pipe(
      catchError(error => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('failed to delete')
        return throwError(() => new Error('failed to delete'))
      })
    )
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url)
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error(errorMessage))
        })
      )
  }
}
