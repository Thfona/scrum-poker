import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { FormGameInterface } from '../interfaces/form-game.interface';
import { GameInterface } from '../interfaces/game.interface';
import { GameSessionUserInterface } from '../interfaces/game-session-user.interface';
import { AuthService } from './auth.service';
import { dateFormatterUtil } from '../utils/dateFormatter.util';
import { generateUniqueIdUtil } from '../utils/generateUniqueId.util';

@Injectable()
export class GamesService {
  public latestCreatedGameId: string;

  constructor(private angularFirestore: AngularFirestore, private authService: AuthService) {}

  public getGame(gameId: string) {
    const GAME_DOCUMENT: AngularFirestoreDocument<GameInterface> = this.angularFirestore.doc(`/games/${gameId}`);

    const GAME = GAME_DOCUMENT.valueChanges();

    return GAME;
  }

  public getGames() {
    const USER_ID = this.authService.user.uid;

    const GAMES_COLLECTION: AngularFirestoreCollection<GameInterface> = this.angularFirestore.collection(
      'games',
      (ref) => {
        return ref.where('ownerId', '==', USER_ID).orderBy('creationDate', 'desc');
      }
    );

    const GAMES = GAMES_COLLECTION.valueChanges();

    return GAMES;
  }

  public createGame(data: FormGameInterface) {
    const GAME_ID = generateUniqueIdUtil();
    const USER_ID = this.authService.user.uid;
    const CREATION_DATE = dateFormatterUtil(new Date());

    this.latestCreatedGameId = GAME_ID;

    const GAME: GameInterface = {
      ...data,
      id: GAME_ID,
      ownerId: USER_ID,
      creationDate: CREATION_DATE,
      stories: [],
      session: {
        isActive: false,
        hasStarted: false,
        currentStoryIndex: 0,
        users: []
      },
      bannedUsers: []
    };

    const GAMES_COLLECTION: AngularFirestoreCollection<GameInterface> = this.angularFirestore.collection('games');

    return GAMES_COLLECTION.doc(GAME_ID).set(GAME);
  }

  public updateGame(gameId: string, data: FormGameInterface) {
    const GAME_DOCUMENT: AngularFirestoreDocument<GameInterface> = this.angularFirestore.doc(`/games/${gameId}`);

    return GAME_DOCUMENT.update({ ...data });
  }

  public deleteGame(gameId: string) {
    const GAME_DOCUMENT: AngularFirestoreDocument<GameInterface> = this.angularFirestore.doc(`/games/${gameId}`);

    return GAME_DOCUMENT.delete();
  }

  public updateBannedUsers(gameId: string, userId: string, operation: 'add' | 'remove') {
    const GAME_DOCUMENT: AngularFirestoreDocument<any> = this.angularFirestore.doc(`/games/${gameId}`);

    if (operation === 'add') {
      return GAME_DOCUMENT.update({ bannedUsers: firebase.firestore.FieldValue.arrayUnion(userId) });
    } else {
      return GAME_DOCUMENT.update({ bannedUsers: firebase.firestore.FieldValue.arrayRemove(userId) });
    }
  }

  public updateGameSessionIsActive(gameId: string, isActive: boolean) {
    const GAME_DOCUMENT: AngularFirestoreDocument<any> = this.angularFirestore.doc(`/games/${gameId}`);

    return GAME_DOCUMENT.update({ 'session.isActive': isActive });
  }

  public updateGameSessionHasStarted(gameId: string, hasStarted: boolean) {
    const GAME_DOCUMENT: AngularFirestoreDocument<any> = this.angularFirestore.doc(`/games/${gameId}`);

    return GAME_DOCUMENT.update({ 'session.hasStarted': hasStarted });
  }

  public updateGameSessionCurrentStory(gameId: string, currentStoryIndex: number) {
    const GAME_DOCUMENT: AngularFirestoreDocument<any> = this.angularFirestore.doc(`/games/${gameId}`);

    return GAME_DOCUMENT.update({ 'session.currentStoryIndex': currentStoryIndex });
  }

  public updateGameSessionUsers(gameId: string, user: GameSessionUserInterface, operation: 'add' | 'remove') {
    const GAME_DOCUMENT: AngularFirestoreDocument<any> = this.angularFirestore.doc(`/games/${gameId}`);

    if (operation === 'add') {
      return GAME_DOCUMENT.update({ 'session.users': firebase.firestore.FieldValue.arrayUnion(user) });
    } else {
      return GAME_DOCUMENT.update({ 'session.users': firebase.firestore.FieldValue.arrayRemove(user) });
    }
  }
}
