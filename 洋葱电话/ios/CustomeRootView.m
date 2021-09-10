//
//  CustomeRootView.m
//  voiceCall_rn
//
//  Created by tim on 11/2/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CustomeRootView.h"

@implementation CustomeRootView


- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event{
    
  
  @try {
    [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
        method:@"emit"
          args:@[@"CustomeViewTouch"]
    completion:NULL];
  } @catch (NSException *exception) {
    
  } @finally {
    
  }
  
    return [super hitTest:point withEvent:event];
}

@end
