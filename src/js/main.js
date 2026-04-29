/**
 * main.js — Punto de entrada de la aplicación
 */
import { App } from './App.js';

const root = document.getElementById('app');
const app  = new App(root);
app.init();
