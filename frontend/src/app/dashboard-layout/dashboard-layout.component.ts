import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import {
  IonApp,
  IonRouterOutlet,
  IonContent,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  IonIcon,
  IonChip,
  IonButton,
  IonMenuToggle,
  IonAccordion,
  IonAccordionGroup,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { chevronForward, keySharp, pencilSharp, createSharp, checkmark, closeOutline, close, chevronForwardSharp, chevronDown } from "ionicons/icons";
import { addIcons } from 'ionicons';
import { WalletService } from '../core/service/wallet.service';
import { environment } from 'src/environments/environment';
import { WalletStatus } from '../core/enum/wallet-status.enum';
import { AccountData } from '@keplr-wallet/types';
import { ShortenAddressPipe } from '../core/pipe/shorten-address.pipe';
import { LottieComponent, LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: 'dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonContent,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonRouterOutlet,
    IonList,
    IonItem,
    IonLabel,
    IonListHeader,
    IonIcon,
    IonChip,
    IonButton,
    IonMenuToggle,
    IonAccordion,
    IonAccordionGroup,
    RouterLink,
    RouterLinkActive,
    ShortenAddressPipe,
    LottieComponent
  ],
})
export class DashboardLayoutComponent {
  showWalletOptions = false;
  isWalletConnected = false;
  walletStatusText = "Connect wallet";
  connectedAccount: any = {};

  constructor(private walletService: WalletService, private alertController: AlertController) {
    addIcons({ chevronForward, keySharp, pencilSharp, createSharp, checkmark, closeOutline, close, chevronForwardSharp, chevronDown });
  }

  async ngOnInit() {
    this.walletService.isConnected().then((isConnected) => {
      this.isWalletConnected = isConnected;
      this.walletService.getAccount().then((account) => {
        this.connectedAccount = account;
      }).catch((err) => {
        this.isWalletConnected = false;
      });
    });
  }

  async connectWallet() {
    if (!this.walletService.hasWallet()) {
      // Popup explaining that Keplr is needed and needs to be installed first
      const alert = await this.alertController.create({
        header: 'Keplr wallet is required',
        message: "We're working on adding more wallet support. Unfortunately, for now you'll need to install Keplr to use this app",
        buttons: [
          {
            text: 'Get Keplr',
            cssClass: 'alert-button-success',
            handler: () => {
              window.open('https://www.keplr.app/', '_blank');
            }
          },
          {
            text: 'Cancel',
            cssClass: 'alert-button-cancel',
            handler: () => {
              alert.dismiss();
            }
          }
        ],
      });
      await alert.present();

      return;
    }
    this.walletStatusText = "Connecting...";
    let walletStatus = await this.walletService.connect();
    switch (walletStatus) {
      case WalletStatus.Connected:
        this.walletStatusText = "Connected";
        this.walletService.getAccount().then((account) => {
          this.isWalletConnected = true;
          this.connectedAccount = account;
        }).catch((err) => {
          this.isWalletConnected = false;
        });
        break;
      case WalletStatus.Rejected:
        // TODO: Popup to inform rejection and try again
        this.walletStatusText = "Connect wallet";
        break;
      case WalletStatus.NotInstalled:
        // TODO: Popup to install Keplr
        this.walletStatusText = "Connect wallet";
        break;
    }
  }

  toggleWalletOptions() {
    this.showWalletOptions = !this.showWalletOptions;
  }

  async disconnectWallet() {
    this.walletService.disconnect();
    this.isWalletConnected = false;
    this.walletStatusText = "Connect wallet";
    this.connectedAccount = {};
  }
}
