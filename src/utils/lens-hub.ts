import { ethers } from 'ethers';
import { LENS_HUB_ABI } from 'src/abi/LensHubAbi';
import { LENS_HUB_PROXY } from './constants';
import { wallet } from '../app.service';

export const lensHub = new ethers.Contract(
  LENS_HUB_PROXY,
  LENS_HUB_ABI,
  wallet,
);
