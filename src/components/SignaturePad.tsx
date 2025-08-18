import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { hp } from '../utilities/constants/constant.style';

export type SignaturePadHandle = {
  reset: () => void;
  getSignature: () => Promise<string | null>;
};

const SignaturePad = forwardRef<SignaturePadHandle>((props, ref) => {
  const signatureRef = useRef<SignatureViewRef>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const resolveRef = useRef<((sig: string | null) => void) | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      signatureRef.current?.clearSignature();
      setSignature(null);
    },
    getSignature: () => {
      return new Promise<string | null>((resolve) => {
        if (signature) {
          resolve(signature);
        } else {
          resolveRef.current = resolve;
          signatureRef.current?.readSignature?.();
        }
      });
    }
  }));

  const handleSignature = (sig: string) => {
    setSignature(sig);
    if (resolveRef.current) {
      resolveRef.current(sig);
      resolveRef.current = null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: hp * 0.3 }}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSignature}
          descriptionText="Sign here"
          webStyle={`.m-signature-pad--footer {display: none;}`}
          autoClear={false}
          dataURL={signature ?? undefined}
        />
      </View>
    </View>
  );
});

export default SignaturePad;
