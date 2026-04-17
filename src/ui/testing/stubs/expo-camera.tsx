import React from 'react'
import { View } from 'react-native'

const grantedPermission = {
  granted: true,
  canAskAgain: true,
  status: 'granted',
}

const CameraComponent = React.forwardRef<any, any>(function CameraComponent(props, ref) {
  return <View ref={ref} {...props}>{props.children}</View>
})

export const Camera = Object.assign(CameraComponent, {
  async getCameraPermissionsAsync() {
    return grantedPermission
  },
  async requestCameraPermissionsAsync() {
    return grantedPermission
  },
})

export const CameraView = Camera

export default Camera