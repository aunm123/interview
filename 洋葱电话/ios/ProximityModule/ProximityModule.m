//
//  ProximityModule.m
//  voiceCall_rn
//
//  Created by tim on 10/3/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ProximityModule.h"

@implementation ProximityModule
{
  bool hasListeners;
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [[UIDevice currentDevice] setProximityMonitoringEnabled:NO];
      [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(sensorStateChange:) name:@"UIDeviceProximityStateDidChangeNotification" object:nil];
    });
  }
  return self;
}

RCT_EXPORT_MODULE();

// 在添加第一个监听函数时触发
-(void)startObserving {
  hasListeners = YES;
}

-(void)stopObserving {
  hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"ProximityStateDidChange"];
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}


RCT_EXPORT_METHOD(proximityEnabled:(BOOL)enabled) {
  dispatch_async(dispatch_get_main_queue(), ^{

    [UIDevice currentDevice].proximityMonitoringEnabled = enabled;
  
  });
}

- (void)dealloc{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}


- (void)sensorStateChange:(NSNotificationCenter *)notification
{
  BOOL proximityState = [[UIDevice currentDevice] proximityState];
  if (hasListeners) {
    [self sendEventWithName:@"ProximityStateDidChange" body:@{@"proximity": @(proximityState)}];
  }
}

@end
