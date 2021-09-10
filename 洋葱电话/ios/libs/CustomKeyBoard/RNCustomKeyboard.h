#import <React/RCTBridge.h>
#import <React/RCTEventEmitter.h>

@interface RNCustomKeyboard : RCTEventEmitter <RCTBridgeModule, UIGestureRecognizerDelegate>
@property (nonatomic, weak) UITapGestureRecognizer *singleTap;
@end
  
